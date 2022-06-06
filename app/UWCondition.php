<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class UWCondition extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'uw_condition';

    public function loan()
    {
        return $this->belongsTo('App\Loan');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'prior_to',
        'status',
        'assigned_to',
        'notes'
    ];
}
