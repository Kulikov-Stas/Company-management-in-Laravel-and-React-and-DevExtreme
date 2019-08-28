<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\EmployeeService;
use App\Employee;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    /**
     * @var EmployeeService
     */
    private $employee;

    /**
     * EmployeeController constructor.
     * @param  EmployeeService  $employee
     */
    public function __construct(EmployeeService $employee)
    {
        $this->employee = $employee;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $employees = $this->employee->getEmployees();
        return response()->json($employees);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $parent_id
     * @return \Illuminate\Http\Response
     */
    public function show($parent_id)
    {
        $employee = $this->employee->getEmployeeByEmployeeId($parent_id);
        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::find($id)->update($request->all());
        return response()->json($employee, 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Employee  $employee
     * @return \Illuminate\Http\Response
     */
    public function delete(Employee $employee)
    {
        $employee->delete();
        return response()->json(null, 204);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $employee = Employee::create($request->all());
        return response()->json($employee, 201);
    }

    /**
     * @param Request $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePhoto(Request $request, int $id)
    {
        $data = $request->all();
        $employee = Employee::find($id);
        if (isset($employee->photo)) {
            Storage::disk('public')->delete($employee->photo);
        }

        $file = $request->file('file');
        $ext = $file->extension();
        $name = str_random(20) . '.' . $ext ;
        $path = Storage::disk('public')->putFileAs(
            'uploads', $file, $name
        );

        $data['photo'] = $name;

        $employee->update($data);

        return response()
            ->json([
                'result' => $data,
                'id' => intval($id)
            ]);
    }
}
