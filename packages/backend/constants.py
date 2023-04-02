from pathlib import Path
import openai
import os

from dotenv import load_dotenv
from fastapi.logger import logger

ENV_PATH = Path(__file__).parent.parent.parent.absolute().joinpath(".env")
FILE_DIR = Path(__file__).parent.parent.parent.absolute().joinpath("videos")
WHISPER__MODEL = "tiny.en"

logger.info(f"Loading environment variables from {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

openai.api_key = os.environ["OPENAI_KEY"]
