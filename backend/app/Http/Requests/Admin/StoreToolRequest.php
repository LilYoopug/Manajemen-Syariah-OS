<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'inputs' => ['nullable', 'array'],
            'outputs' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'sharia_basis' => ['nullable', 'string'],
            'link' => ['nullable', 'string', 'url', 'max:500'],
            'related_directory_ids' => ['nullable', 'array'],
            'related_dalil_text' => ['nullable', 'string'],
            'related_dalil_source' => ['nullable', 'string', 'max:500'],
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
            'name.required' => 'Tool name is required.',
            'category.required' => 'Category is required.',
            'description.required' => 'Description is required.',
            'link.url' => 'Link must be a valid URL.',
        ];
    }
}
