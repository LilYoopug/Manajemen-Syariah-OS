<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tool extends Model
{
    /** @use HasFactory<\Database\Factories\ToolFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'category',
        'description',
        'inputs',
        'outputs',
        'benefits',
        'sharia_basis',
        'link',
        'related_directory_ids',
        'related_dalil_text',
        'related_dalil_source',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'inputs' => 'array',
            'outputs' => 'array',
            'benefits' => 'array',
            'related_directory_ids' => 'array',
        ];
    }
}
