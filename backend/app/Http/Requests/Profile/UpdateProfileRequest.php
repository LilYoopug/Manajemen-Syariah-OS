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
            'profilePicture' => ['nullable', 'string', function ($attribute, $value, $fail) {
                // Allow empty/null values
                if (empty($value)) {
                    return;
                }
                // Allow data URLs (base64 images) - max ~2.7MB (2MB file = ~2.7MB base64)
                if (str_starts_with($value, 'data:image/')) {
                    if (strlen($value) > 3000000) {
                        $fail('Profile picture must be less than 2MB.');
                    }
                    return;
                }
                // Allow regular URLs
                if (filter_var($value, FILTER_VALIDATE_URL) !== false) {
                    if (strlen($value) > 500) {
                        $fail('Profile picture URL is too long.');
                    }
                    return;
                }
                $fail('The profile picture must be a valid URL or base64 image data.');
            }],
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
            'profilePicture.max' => 'Profile picture is too large.',
            'theme.in' => 'Theme must be either light or dark.',
            'zakatRate.numeric' => 'Zakat rate must be a number.',
            'zakatRate.min' => 'Zakat rate must be at least 0.',
            'zakatRate.max' => 'Zakat rate may not be greater than 100.',
            'preferredAkad.max' => 'Preferred akad may not be greater than 100 characters.',
            'calculationMethod.in' => 'Calculation method must be either Hijri or Masehi.',
        ];
    }
}
