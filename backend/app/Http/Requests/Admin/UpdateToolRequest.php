<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateToolRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'inputs' => ['nullable', 'array'],
            'inputs.*' => ['string'],
            'outputs' => ['nullable', 'array'],
            'outputs.*' => ['string'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string'],
            'shariaBasis' => ['nullable', 'string'],
            'link' => ['nullable', 'string', 'max:500'],
            'relatedDirectoryIds' => ['nullable', 'array'],
            'relatedDalilText' => ['nullable', 'string'],
            'relatedDalilSource' => ['nullable', 'string', 'max:500'],
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
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case
        $this->merge([
            'sharia_basis' => $this->shariaBasis,
            'related_directory_ids' => $this->relatedDirectoryIds,
            'related_dalil_text' => $this->relatedDalilText,
            'related_dalil_source' => $this->relatedDalilSource,
        ]);
    }
}
