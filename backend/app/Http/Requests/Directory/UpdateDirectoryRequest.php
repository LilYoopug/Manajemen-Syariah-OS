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
            'content.sources' => ['nullable', 'array'],
            'content.sources.*.type' => ['required_with:content.sources', 'in:quran,hadith,website,none'],
            // Quran source validation
            'content.sources.*.surah' => ['required_if:content.sources.*.type,quran', 'integer', 'min:1', 'max:114'],
            'content.sources.*.verse' => ['required_if:content.sources.*.type,quran', 'integer', 'min:1'],
            // Hadith source validation
            'content.sources.*.book' => ['required_if:content.sources.*.type,hadith', 'string', 'max:50'],
            'content.sources.*.number' => ['required_if:content.sources.*.type,hadith', 'integer', 'min:1'],
            // Website source validation
            'content.sources.*.title' => ['required_if:content.sources.*.type,website', 'string', 'max:255'],
            'content.sources.*.url' => ['required_if:content.sources.*.type,website', 'url', 'max:500'],
            // Explanation
            'content.explanation' => ['nullable', 'string', 'max:10000'],
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
            'title.max' => 'Judul tidak boleh lebih dari 255 karakter.',
            'parentId.exists' => 'Direktori induk tidak ditemukan.',
            'content.sources.*.type.in' => 'Tipe sumber harus quran, hadith, website, atau none.',
            'content.sources.*.surah.required_if' => 'Surah wajib dipilih untuk sumber Quran.',
            'content.sources.*.verse.required_if' => 'Ayat wajib diisi untuk sumber Quran.',
            'content.sources.*.book.required_if' => 'Kitab hadist wajib dipilih untuk sumber Hadist.',
            'content.sources.*.number.required_if' => 'Nomor hadist wajib diisi untuk sumber Hadist.',
            'content.sources.*.title.required_if' => 'Judul website wajib diisi.',
            'content.sources.*.url.required_if' => 'URL website wajib diisi.',
            'content.sources.*.url.url' => 'Format URL tidak valid.',
        ];
    }
}
