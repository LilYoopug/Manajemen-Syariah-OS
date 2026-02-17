<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            'text' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'resetCycle' => ['nullable', 'string', Rule::in(['one-time', 'daily', 'weekly', 'monthly', 'yearly'])],
            'hasLimit' => ['nullable', 'boolean'],
            'targetValue' => ['nullable', 'integer', 'min:0', 'required_if:hasLimit,true'],
            'unit' => ['nullable', 'string', 'max:50', 'required_if:hasLimit,true'],
            'incrementValue' => ['nullable', 'integer', 'min:1'],
            'perCheckEnabled' => ['nullable', 'boolean'],
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
            'text.required' => 'Task description is required.',
            'text.max' => 'Task description may not be greater than 255 characters.',
            'category.required' => 'Category is required.',
            'resetCycle.in' => 'Reset cycle must be one of: one-time, daily, weekly, monthly, yearly.',
            'targetValue.required_if' => 'Target value is required when has limit is enabled.',
            'targetValue.integer' => 'Target value must be a number.',
            'targetValue.min' => 'Target value must be at least 0.',
            'unit.required_if' => 'Unit is required when has limit is enabled.',
            'incrementValue.min' => 'Increment value must be at least 1.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set defaults for optional boolean fields
        $this->merge([
            'hasLimit' => $this->boolean('hasLimit'),
            'perCheckEnabled' => $this->boolean('perCheckEnabled'),
        ]);

        // Set default increment value
        if (!$this->has('incrementValue') && $this->boolean('hasLimit')) {
            $this->merge(['incrementValue' => 1]);
        }
    }
}
