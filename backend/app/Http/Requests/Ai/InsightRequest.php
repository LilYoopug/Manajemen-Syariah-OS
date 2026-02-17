<?php

namespace App\Http\Requests\Ai;

use Illuminate\Foundation\Http\FormRequest;

class InsightRequest extends FormRequest
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
            'kpiData' => ['required', 'array'],
            'goalData' => ['nullable', 'array'],
            // Allow flexible KPI data structure - each key can be an object with value/change
            'kpiData.*' => ['nullable'],
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
            'kpiData.required' => 'KPI data is required for insight generation.',
            'kpiData.array' => 'KPI data must be provided as an object.',
        ];
    }
}
