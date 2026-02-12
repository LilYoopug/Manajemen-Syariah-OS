<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'text',
        'completed',
        'category',
        'progress',
        'has_limit',
        'current_value',
        'target_value',
        'unit',
        'reset_cycle',
        'per_check_enabled',
        'increment_value',
        'last_reset_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'has_limit' => 'boolean',
            'per_check_enabled' => 'boolean',
            'progress' => 'integer',
            'current_value' => 'integer',
            'target_value' => 'integer',
            'increment_value' => 'integer',
            'last_reset_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the history entries for the task.
     */
    public function history(): HasMany
    {
        return $this->hasMany(TaskHistory::class);
    }
}
