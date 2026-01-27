from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
def run_incremental_predictions():
    import boto3
    import json
    import pandas as pd
    import io
    from sagemaker.predictor import Predictor

    s3 = boto3.client("s3")

    BUCKET = "my-healthcare-analytics-data"
    FEATURE_PREFIX = "ml_features/"
    CHECKPOINT_KEY = "checkpoints/processed_files.json"

    # Load checkpoint
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=CHECKPOINT_KEY)
        processed = json.loads(obj["Body"].read())
    except:
        processed = []

    # List parquet files
    response = s3.list_objects_v2(Bucket=BUCKET, Prefix=FEATURE_PREFIX)
    all_files = [
        obj["Key"] for obj in response.get("Contents", [])
        if obj["Key"].endswith(".parquet")
    ]

    new_files = list(set(all_files) - set(processed))
    if not new_files:
        print("No new data")
        return

    dfs = []
    for key in new_files:
        obj = s3.get_object(Bucket=BUCKET, Key=key)
        df = pd.read_parquet(io.BytesIO(obj["Body"].read()))
        dfs.append(df)

    data = pd.concat(dfs, ignore_index=True)

    # Feature logic
    data["high_bp_risk"] = data["lab_result_bp"] > 140
    data["icu_risk"] = data["severity_score"] > 5
    data["frequent_visitor"] = data["previous_visit_gap_days"] < 30

    # Call SageMaker endpoint
    predictor = Predictor("long-stay-xgb-v2")
    payload = data[["age","bmi","severity_score","chronic_count"]].to_csv(index=False, header=False)
    preds = predictor.predict(payload)

    data["long_stay_probability"] = preds

    # Save results
    buffer = io.BytesIO()
    data.to_parquet(buffer, index=False)

    s3.put_object(
        Bucket=BUCKET,
        Key="predictions/latest_predictions.parquet",
        Body=buffer.getvalue()
    )

    processed.extend(new_files)
    s3.put_object(
        Bucket=BUCKET,
        Key=CHECKPOINT_KEY,
        Body=json.dumps(processed)
    )
with DAG(
    dag_id="healthcare_streaming_predictions",
    start_date=datetime(2024, 1, 1),
    schedule_interval="*/5 * * * *",  # every 5 minutes
    catchup=False
) as dag:

    run_predictions = PythonOperator(
        task_id="run_incremental_predictions",
        python_callable=run_incremental_predictions
    )
