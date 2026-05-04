<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Task $task): bool
    {
        return $user->is($task->user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Task $task): bool
    {
        return $user->is($task->user);
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->is($task->user);
    }

    public function restore(User $user, Task $task): bool
    {
        return $user->is($task->user);
    }

    public function forceDelete(User $user, Task $task): bool
    {
        return $user->is($task->user);
    }
}
