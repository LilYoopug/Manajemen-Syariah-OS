<?php

namespace App\Console\Commands;

use App\Services\TaskResetService;
use Illuminate\Console\Command;

class ResetTasksCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset recurring tasks based on their reset cycle (daily/weekly/monthly/yearly)';

    /**
     * @var TaskResetService
     */
    protected TaskResetService $taskResetService;

    /**
     * Create a new command instance.
     */
    public function __construct(TaskResetService $taskResetService)
    {
        parent::__construct();
        $this->taskResetService = $taskResetService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting task reset process...');

        $resetCount = $this->taskResetService->resetEligibleTasks();

        if ($resetCount > 0) {
            $this->info("Successfully reset {$resetCount} task(s).");
        } else {
            $this->info('No tasks required resetting.');
        }

        return self::SUCCESS;
    }
}
