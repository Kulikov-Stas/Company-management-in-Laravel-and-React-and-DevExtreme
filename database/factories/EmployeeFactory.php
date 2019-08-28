<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Employee;
use Faker\Generator as Faker;

$factory->define(Employee::class, function (Faker $faker) {
    return [
        'fio' => $this->faker->name,
        'position_id' => $this->faker->numberBetween(1, 5),
        'salary' => $this->faker->randomFloat(2, 100, 2000),
        'employment_date' => $this->faker->date('Y-m-d')
    ];
});
