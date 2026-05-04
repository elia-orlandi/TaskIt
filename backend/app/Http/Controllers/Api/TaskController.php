<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tasks = $request->user()->tasks()
            ->with(['category', 'parentTask'])
            ->orderBy('order_position')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        return response()->json(['data' => $task], 201);
    }

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return response()->json(['data' => $task->load(['category', 'parentTask', 'subtasks'])]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->update($request->validated());

        return response()->json(['data' => $task->fresh(['category', 'parentTask'])]);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json(null, 204);
    }

    public function toggleComplete(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->completed_at = $task->completed_at ? null : now();
        $task->save();

        return response()->json(['data' => $task->fresh()]);
    }
}
