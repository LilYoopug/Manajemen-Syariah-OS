<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class TaskHistory extends Model
{
    /** @use HasFactory<\Database\Factories\TaskHistoryFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'value',
        'note',
        'timestamp',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'timestamp' => 'datetime',
        ];
    }

    /**
     * Get the task that owns the history entry.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
