<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public string $token;

    public function __construct(string $token)
    {
        $this->token = $token;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $email = $notifiable->getEmailForPasswordReset();
        $resetUrl = env('FRONTEND_URL', 'http://localhost:4200') . "/password-reset/{$this->token}?email={$email}";

        return (new MailMessage)
            ->subject(__('mail.reset_password.subject'))
            ->greeting(__('mail.reset_password.greeting'))
            ->line(__('mail.reset_password.body'))
            ->action(__('mail.reset_password.action'), $resetUrl)
            ->line(__('mail.reset_password.expire'))
            ->line(__('mail.reset_password.ignore'))
            ->salutation(__('mail.reset_password.salutation'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'token' => $this->token,
        ];
    }
}