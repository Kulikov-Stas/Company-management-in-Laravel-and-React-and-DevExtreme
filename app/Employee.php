<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class Employee extends Model
{
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var  bool
     */
    public $incrementing = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var  array
     */
    protected $fillable = [
        'fio',
        'parent_id',
        'position_id',
        'salary',
        'employment_date',
        'photo'
    ];

    /**
     * smart deleting
     */
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($model) {
            $sibling = Employee::where([
                ['parent_id', $model->parent_id],
                ['id', '!=', $model->id]
            ])->first();

            DB::table($model->getTable())
                ->where('parent_id', $model->id)
                ->update(['parent_id' => $sibling->id ?? $model->parent_id]);

            Storage::disk('public')->delete($model->photo);
        });
    }

    /**
     * @return  \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function position()
    {
        return $this->hasOne('App\Position', 'id', 'position_id');
    }

    /**
     * @return  \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function parent()
    {
        return $this->belongsTo('App\Employee', 'parent_id');
    }

    /**
     * @return  \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function child()
    {
        return $this->hasMany('App\Employee', 'parent_id');
    }

}
