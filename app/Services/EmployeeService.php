<?php

namespace App\Services;

use App\Employee;
use Illuminate\Http\Request;

class EmployeeService
{
    /**
     * @param  string  $name
     * @return \Illuminate\Support\Collection
     */
    public function getEmployees($name = '')
    {
        if (!empty($name)) {
            return Employee::with(['position', 'child'])->where('fio', 'like', "%$name%")->orderBy('id')->get();
        }
        return Employee::with(['position', 'child'])
            ->whereNull('parent_id')
            ->orwhereIn('parent_id', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            ->orderBy('id')->get();
    }

    /**
     * @param  int  $employeeId
     * @return array
     */
    public function getEmployeeByEmployeeId(int $employeeId)
    {
        $parents = Employee::with(['position', 'child'])->where('parent_id', $employeeId)->get();
        $childs = [];
        $all_childs = [];
        foreach ($parents as &$parent) {
            if (!empty($parent->child)) {
                $childs = $parent->child;
                foreach ($childs as &$child) {
                    $all_childs[] = $child;
                }
            }
        }
        return array_merge($all_childs, $parents->toArray());
    }
}
