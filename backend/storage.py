import os
import uuid
from pathlib import PurePosixPath
from urllib.request import urlopen

import cloudinary
import cloudinary.uploader
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class CloudinaryMediaStorage(Storage):
    """
    Хранилище пользовательских изображений в Cloudinary.
    """

    def _save(self, name, content):
        path = PurePosixPath(name)
        extension = path.suffix.lower()
        directory = str(path.parent)

        # Уникальный идентификатор исключает перезапись файлов
        filename = f"{path.stem}_{uuid.uuid4().hex}"
        public_id = (
            f"{directory}/{filename}"
            if directory != "."
            else filename
        )

        content.seek(0)

        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            overwrite=False,
        )

        return f"{result['public_id']}.{result['format']}"

    def _open(self, name, mode="rb"):
        response = urlopen(self.url(name))
        return ContentFile(response.read(), name=os.path.basename(name))

    def exists(self, name):
        # Имена файлов генерируются с UUID при сохранении
        return False

    def delete(self, name):
        public_id = str(PurePosixPath(name).with_suffix(""))

        cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
        )

    def url(self, name):
        public_id = str(PurePosixPath(name).with_suffix(""))
        extension = PurePosixPath(name).suffix.lstrip(".")

        return cloudinary.CloudinaryImage(public_id).build_url(
            secure=True,
            format=extension or None,
        )
