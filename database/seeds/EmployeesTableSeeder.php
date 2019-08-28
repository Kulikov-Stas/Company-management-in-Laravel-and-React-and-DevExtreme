<?php

use Illuminate\Database\Seeder;
use App\Employee;

class EmployeesTableSeeder extends Seeder
{
    /**
     * EmployeesTableSeeder constructor.
     */
    public function __construct()
    {
        $this->faker = Faker\Factory::create();
    }
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(Employee::class, 10)->create(['position_id' => 1])->each(function ($q) {
            factory(Employee::class, 10)->create(['parent_id' => $q->id, 'position_id' => 2])->each(function ($w) {
                factory(Employee::class, 10)->create(['parent_id' => $w->id, 'position_id' => 3])->each(function ($e) {
                    factory(Employee::class, 10)->create(['parent_id' => $e->id, 'position_id' => 4])->each(function ($r) {
                        factory(Employee::class, 10)->create(['parent_id' => $r->id, 'position_id' => 5])->each(function ($t) {
                            $this->command->info($t->id);
                        });
                    });
                });
            });
        });
    }
}
