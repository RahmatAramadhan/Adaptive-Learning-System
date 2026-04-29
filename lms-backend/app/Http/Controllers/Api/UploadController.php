<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload a file (image, video, audio) to public storage.
     * Returns the publicly accessible URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100 MB max
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();

        // Determine subfolder by MIME type
        if (str_starts_with($mime, 'image/')) {
            $folder = 'uploads/images';
        } elseif (str_starts_with($mime, 'video/')) {
            $folder = 'uploads/videos';
        } elseif (str_starts_with($mime, 'audio/')) {
            $folder = 'uploads/audio';
        } else {
            $folder = 'uploads/files';
        }

        $path = $file->store($folder, 'public');
        
        // Generate full URL directly from config and path
        $fullUrl = config('app.url') . '/storage/' . $path;

        return response()->json([
            'url'  => $fullUrl,
            'path' => $path,
        ]);
    }
}
