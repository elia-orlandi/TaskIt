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
        $query = $request->user()->tasks()->with(['category', 'parentTask']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->has('completed')) {
            $completed = $request->input('completed');
            if (in_array($completed, ['true', '1', 1], true)) {
                $query->whereNotNull('completed_at');
            } else {
                $query->whereNull('completed_at');
            }
        }

        if ($request->filled('due_date_from')) {
            $query->whereDate('due_date', '>=', $request->input('due_date_from'));
        }

        if ($request->filled('due_date_to')) {
            $query->whereDate('due_date', '<=', $request->input('due_date_to'));
        }

        if ($request->filled('parent_task_id')) {
            $query->where('parent_task_id', $request->input('parent_task_id'));
        }

        if ($request->filled('sort_by')) {
            $sortDir = $request->input('sort_dir', 'asc');
            $query->orderBy($request->input('sort_by'), $sortDir);
        } else {
            $query->orderBy('order_position');
        }

        $perPage = $request->input('per_page', 15);
        $tasks = $query->paginate($perPage);

        return response()->json($tasks);
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

        return response()->json(['data' => $task->fresh(['category'])]);
    }
}
