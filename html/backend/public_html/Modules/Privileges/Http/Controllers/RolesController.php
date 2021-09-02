<?php

namespace Modules\Privileges\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Models\User;
use Illuminate\Console\Command;
use Modules\Privileges\Repositories\RoleRepository;
use Spatie\Permission\Models\Permission;
use Modules\CoreConfig\Repositories\CoreConfigRepository;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class RolesController extends Controller
{
    /**
     * @var RoleRepository
     */
    private $roleRepository;
    /**
     * @var CoreConfigRepository
     */
    private $configRepository;

    public function __construct(
        RoleRepository $roleRepository,
        CoreConfigRepository $configRepository
    )
    {
        $this->roleRepository   = $roleRepository;
        $this->configRepository = $configRepository;
    }

    public function add(Request $request)
    {
        $data      = $request->only('name');
        $validator = Validator::make($data, [
            'name' => 'required|string',
        ], $messages = [
            'required' => 'The :attribute field is required.',
        ]);

        //Send failed response if request is not valid
        if ($validator->fails()) {
            return response()->json(['error' => $validator->messages()], 200);
        }

        $configSuperPrivilege = $this->configRepository->findOneBy('path', 'super-privilege');

        $currUser = auth()->user();
        // This api allow on root, super-privilege of this website handle and process
        if ($currUser->email !== $configSuperPrivilege->value) {
            return response()->json(['error' => 'PERMISSION_DENIED'], 200);
        }

        try {
            // Check current user is belong group administrator
            $role = $this->roleRepository->findByName($request->name);
        } catch (\Spatie\Permission\Exceptions\RoleDoesNotExist $e) {}

        if (empty($role)) {
            try {
                $this->roleRepository->create(['name' => $request->name]);
                return response()->json([
                    'success' => true,
                    'message' => 'Role created successfully',
                ], Response::HTTP_OK);
            } catch (\Exception $e) {
                return response()->json(['error' => $e->getMessage()], 200);
            }
        } else {
            return response()->json(['error' => 'Exists role: ' . $request->name], 200);
        }
    }

    public function all()
    {
        
    }
}
