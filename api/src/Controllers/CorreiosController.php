<?php
namespace App\Controllers;

class CorreiosController
{
    public function lookup(array $params, array $body): array
    {
        $cep = preg_replace('/\D/', '', $params['cep'] ?? '');

        if (strlen($cep) !== 8) {
            http_response_code(400);
            return ['error' => 'CEP inválido.'];
        }

        $url = sprintf('https://viacep.com.br/ws/%s/json/', $cep);
        $context = stream_context_create([
            'http' => [
                'timeout' => 5,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        if ($response === false) {
            http_response_code(502);
            return ['error' => 'Não foi possível consultar o CEP.'];
        }

        $data = json_decode($response, true);
        if (!is_array($data) || !empty($data['erro'])) {
            http_response_code(404);
            return ['error' => 'CEP não encontrado.'];
        }

        return [
            'cep' => $data['cep'] ?? '',
            'street' => $data['logradouro'] ?? '',
            'complement' => $data['complemento'] ?? '',
            'neighborhood' => $data['bairro'] ?? '',
            'city' => $data['localidade'] ?? '',
            'state' => $data['uf'] ?? '',
        ];
    }
}
