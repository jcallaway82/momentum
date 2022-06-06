<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class PipelineFilter extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'pipelineFilters';

    public function users() {
        return $this->belongsTo('App\User');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'filter_name',
        'filter_value'
    ];


}
