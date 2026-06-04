from io import BytesIO
from PIL import Image
from werkzeug.datastructures import FileStorage
from config import Config


EXTENSIONS = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def validate_image(file: FileStorage):
    if not file:
        return None
    data = file.read()
    file.seek(0)
    if len(data) > Config.MAX_IMAGE_BYTES:
        raise ValueError("Image must be 5MB or smaller.")
    mimetype = file.mimetype
    if mimetype not in Config.ALLOWED_IMAGE_TYPES:
        raise ValueError("Only JPEG, PNG, and WebP images are allowed.")
    try:
        Image.open(BytesIO(data)).verify()
    except Exception as exc:
        raise ValueError("Uploaded file is not a valid image.") from exc
    return data


def resize_image(file: FileStorage, max_size=(1400, 1400)):
    data = validate_image(file)
    if data is None:
        return None, None
    image = Image.open(BytesIO(data)).convert("RGB")
    image.thumbnail(max_size)
    output = BytesIO()
    fmt = "JPEG" if file.mimetype == "image/jpeg" else file.mimetype.split("/")[-1].upper()
    if fmt == "WEBP":
        image.save(output, format="WEBP", quality=84)
    elif fmt == "PNG":
        image.save(output, format="PNG", optimize=True)
    else:
        image.save(output, format="JPEG", quality=86, optimize=True)
    output.seek(0)
    return output.read(), file.mimetype

