<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;

class Reply extends Model implements AuditableContract
{
    use Auditable;

    protected $table = 'replies';

    public function comment()
    {
        return $this->belongsTo('App\Comment');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'comment',
        'user',
        'tagged_user'
    ];
}
