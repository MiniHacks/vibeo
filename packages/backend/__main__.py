import uvicorn
import backend.app as app
import os
from fastapi.logger import logger

logger.setLevel("DEBUG")

uvicorn.run(app.app, host="0.0.0.0", port=int(os.environ.get("BACKEND_PORT", 8000)))
