from pathlib import Path

ENV_PATH = Path(__file__).parent.parent.parent.absolute().joinpath(".env")
FILE_DIR = Path(__file__).parent.parent.parent.absolute().joinpath("videos")
WHISPER__MODEL = "tiny.en"
