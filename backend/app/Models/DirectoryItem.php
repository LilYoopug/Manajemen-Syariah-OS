<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class DirectoryItem extends Model
{
    /** @use HasFactory<\Database\Factories\DirectoryItemFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'parent_id',
        'title',
        'type',
        'content',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'string',
        ];
    }

    /**
     * Get the user that owns this directory item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent directory item.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(DirectoryItem::class, 'parent_id');
    }

    /**
     * Get the children directory items.
     */
    public function children(): HasMany
    {
        return $this->hasMany(DirectoryItem::class, 'parent_id');
    }

    /**
     * Scope to get items for a specific user (including shared/system items).
     */
    public function scopeForUser($query, ?int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)
              ->orWhereNull('user_id'); // System-wide items
        });
    }
}
