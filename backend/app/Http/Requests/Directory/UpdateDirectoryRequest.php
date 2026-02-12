<?php

namespace App\Http\Requests\Directory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDirectoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'parentId' => ['nullable', 'exists:directory_items,id'],
            'content' => ['nullable', 'array'],
            'content.dalil' => ['nullable', 'string'],
            'content.source' => ['nullable', 'string', 'max:255'],
            'content.explanation' => ['nullable', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Title may not be greater than 255 characters.',
            'parentId.exists' => 'Parent directory does not exist.',
        ];
    }
}
