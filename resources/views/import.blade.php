@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="panel panel-default">
                    <div class="panel-heading">Import PipeLine File</div>

                    <div class="panel-body">
                        @if (session('status'))
                            <div class="alert alert-success">
                                {{ session('status') }}
                            </div>
                        @endif

                        <form style="border: 4px solid #a1a1a1;margin-top: 15px;padding: 10px;" action="{{ URL::to('/importPipeline') }}" class="form-horizontal" method="post" enctype="multipart/form-data">
                            <input type ="hidden" name ="_token" value ="{{ csrf_token() }}" />
                            <input type="file" name="import_file" />
                            <br>
                            <button class="btn btn-primary">Import File</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection