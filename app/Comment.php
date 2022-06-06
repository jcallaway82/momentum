<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Comment extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'comments';

    public function loan()
    {
        return $this->belongsTo('App\Loan');
    }

    public function reply() {
        return $this->hasMany('App\Reply');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'field_name',
        'comment',
        'user',
        'tagged_user',
        'procNeedList_id',
        'uwCondition_id'
    ];
}
