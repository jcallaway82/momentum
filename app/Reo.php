<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Reo extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'reos';

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
        'property',
        'status',
        'deed',
        'mortgage_stmnt',
        'taxes',
        'insurance',
        'lease'
    ];
}
