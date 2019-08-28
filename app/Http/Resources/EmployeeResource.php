<?php

namespace App\Http\Resources;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'type'          => 'employee',
            'id'            => (string)$this->id,
            'attributes'    => [
                'fio' => $this->name,
                'salary' => $this->salary,
                'employment_date' => $this->employment_date,
                'position_id' => $this->position_id,
                'parent_id' => $this->parent_id,
                'photo' => $this->photo ? Storage::url($this->photo) : null
            ],
            'children' => $this->children,
            'parent' => $this->parent
        ];
    }
}
