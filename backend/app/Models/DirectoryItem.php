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
}
