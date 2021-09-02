<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class InitRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'init:roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create some init roles';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        //$role = Role::create(['name' => 'administrator']);
        $permission = Permission::findOrCreate('edit:resume');
        // CREATE $permission = Permission::create(['name' => 'submit:resume']);
        //$permission->assignRole($role);
        //Role::where(['name' => 'collaborators'])->delete();
        //Permission::where(['name' => 'submit:resume'])->delete();

        $role = Role::findByName('collaborators');
        $user = User::find(1);

        //$user->assignRole(['administrator']);
        printf("<pre>");
        print_r($user->hasPermissionTo('edit:resume'));
        printf("</pre>");
        //exit;
        return 0;
    }
}
