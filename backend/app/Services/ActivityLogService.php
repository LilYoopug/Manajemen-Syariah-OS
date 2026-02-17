<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log an activity.
     *
     * @param string $action The action being performed (e.g., 'user.login', 'task.created')
     * @param mixed $subject The subject of the action (optional)
     * @param array $metadata Additional metadata (optional)
     * @return ActivityLog
     */
    public function log(string $action, $subject = null, array $metadata = []): ActivityLog
    {
        $userId = Auth::id();

        $logData = [
            'user_id' => $userId,
            'action' => $action,
            'metadata' => $metadata,
        ];

        if ($subject && is_object($subject)) {
            $logData['subject_type'] = get_class($subject);
            $logData['subject_id'] = $subject->id;
        }

        return ActivityLog::create($logData);
    }

    /**
     * Log a user authentication action.
     *
     * @param string $action The authentication action (e.g., 'user.login', 'user.logout', 'user.registered')
     * @param int|null $userId The user ID (optional, defaults to authenticated user)
     * @param array $metadata Additional metadata (optional)
     * @return ActivityLog
     */
    public function logAuth(string $action, ?int $userId = null, array $metadata = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $userId ?? Auth::id(),
            'action' => $action,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log a CRUD action on a model.
     *
     * @param string $action The CRUD action (e.g., 'task.created', 'task.updated', 'task.deleted')
     * @param mixed $subject The model being acted upon
     * @param array $metadata Additional metadata (optional)
     * @return ActivityLog
     */
    public function logCrud(string $action, $subject, array $metadata = []): ActivityLog
    {
        return $this->log($action, $subject, $metadata);
    }

    /**
     * Log an admin action.
     *
     * @param string $action The admin action (e.g., 'admin.user_created', 'admin.tool_updated')
     * @param mixed $subject The subject of the action
     * @param array $metadata Additional metadata (optional)
     * @return ActivityLog
     */
    public function logAdmin(string $action, $subject = null, array $metadata = []): ActivityLog
    {
        return $this->log($action, $subject, $metadata);
    }
}
