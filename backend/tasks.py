from celery import shared_task
import time


@shared_task
def send_feedback_email_task(user_email, message):
    time.sleep(3)  # Имитация долгой отправки письма
    print(f"Письмо от {user_email} успешно отправлено!")
