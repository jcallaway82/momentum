@extends('layouts.app')

@section('title', '| Users')

@section('content')

    <div class="col-lg-10 col-lg-offset-1">
        <h1><i class="fa fa-users"></i> User Administration <a href="{{ route('roles.index') }}" class="btn btn-default pull-right">Roles</a>
            <a href="{{ route('permissions.index') }}" class="btn btn-default pull-right">Permissions</a></h1>
        <hr>
        <div class="table-responsive">
            <table class="table table-bordered table-striped">

                <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date/Time Added</th>
                    <th>Deleted Date</th>
                    <th>Operations</th>
                </tr>
                </thead>

                <tbody>
                @foreach ($users as $user)
                    <tr>

                        <td>{{ $user->name }}</td>
                        <td>{{ $user->email }}</td>
                        <td>{{ $user->created_at->format('F d, Y h:ia') }}</td>
                        <td>{{ $user->deleted_at->format('F d, Y h:ia') }}</td>
                        <td>
                            {!! Form::open(['route' => ['userRestore', $user->id] ]) !!}
                            {!! Form::hidden('id', $user->id) !!}
                            {!! Form::submit('Restore', ['class' => 'btn btn-info pull-left']) !!}
                            {!! Form::close() !!}

                        </td>
                    </tr>
                @endforeach
                </tbody>

            </table>
        </div>

        <a href="{{ route('users.index') }}" class="btn btn-success">View Active Users</a>
    </div>

@endsection