<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Default categories to seed for new users.
     */
    private const DEFAULT_CATEGORIES = [
        'SDM',
        'Keuangan',
        'Kepatuhan',
        'Pemasaran',
        'Operasional',
        'Teknologi',
    ];

    /**
     * Handle the User "created" event.
     *
     * Seed default categories for the new user.
     */
    public function created(User $user): void
    {
        $categories = array_map(fn ($name) => ['name' => $name], self::DEFAULT_CATEGORIES);

        $user->categories()->createMany($categories);
    }
}
