<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'profilePicture' => ['nullable', 'string', 'max:500', 'url'],
            'theme' => ['sometimes', 'string', Rule::in(['light', 'dark'])],
            'zakatRate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'preferredAkad' => ['nullable', 'string', 'max:100'],
            'calculationMethod' => ['nullable', 'string', Rule::in(['Hijri', 'Masehi'])],
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
            'name.string' => 'Name must be a string.',
            'name.max' => 'Name may not be greater than 255 characters.',
            'profilePicture.max' => 'Profile picture URL may not be greater than 500 characters.',
            'profilePicture.url' => 'Profile picture must be a valid URL.',
            'theme.in' => 'Theme must be either light or dark.',
            'zakatRate.numeric' => 'Zakat rate must be a number.',
            'zakatRate.min' => 'Zakat rate must be at least 0.',
            'zakatRate.max' => 'Zakat rate may not be greater than 100.',
            'preferredAkad.max' => 'Preferred akad may not be greater than 100 characters.',
            'calculationMethod.in' => 'Calculation method must be either Hijri or Masehi.',
        ];
    }
}
