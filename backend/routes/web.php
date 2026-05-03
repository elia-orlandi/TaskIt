<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\ResetPasswordController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/password-reset/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
