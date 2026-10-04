async function calcularFrete() {

    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    const resultado = document.getElementById("resultado");

    if (cep.length !== 8) {
        resultado.innerHTML = "<p class='erro'>Digite um CEP válido.</p>";
        return;
    }

    resultado.innerHTML = "Calculando...";

    try {

        // Consulta o CEP na API ViaCEP
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        const endereco = await resposta.json();

        if (endereco.erro) {
            resultado.innerHTML = "<p class='erro'>CEP não encontrado.</p>";
            return;
        }

        // Monta o endereço
        const enderecoCompleto =
            `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;

        // API pública para descobrir latitude e longitude
        const geoResposta = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`
        );

        const localizacao = await geoResposta.json();

        if (localizacao.length === 0) {
            resultado.innerHTML =
                "<p class='erro'>Não foi possível localizar esse endereço.</p>";
            return;
        }

        const latitudeDestino = Number(localizacao[0].lat);
        const longitudeDestino = Number(localizacao[0].lon);


        /*
            Coordenadas aproximadas da
            UNINASSAU Parangaba.

            Para um projeto acadêmico simples,
            usamos a instituição como ponto de origem.
        */

        const latitudeUninassau = -3.777;
        const longitudeUninassau = -38.563;


        // Calcula a distância
        const distancia = calcularDistancia(
            latitudeUninassau,
            longitudeUninassau,
            latitudeDestino,
            longitudeDestino
        );


        /*
            Simulação do Uber Moto

            Taxa inicial: R$ 4,00
            Valor por KM: R$ 1,50
        */

        const taxaInicial = 4;
        const precoKm = 1.50;

        const frete = taxaInicial + (distancia * precoKm);


        resultado.innerHTML = `
            <strong>Endereço:</strong><br>

            ${endereco.logradouro}<br>
            ${endereco.bairro}<br>
            ${endereco.localidade} - ${endereco.uf}

            <br><br>

            <strong>Distância aproximada:</strong>
            ${distancia.toFixed(2)} km

            <br><br>

            <strong>Frete estimado:</strong><br>

            <span class="valor">
                R$ ${frete.toFixed(2)}
            </span>
        `;

    } catch (erro) {

        console.error(erro);

        resultado.innerHTML =
            "<p class='erro'>Erro ao calcular o frete.</p>";
    }
}



// Calcula distância entre duas coordenadas
function calcularDistancia(lat1, lon1, lat2, lon2) {

    const raioTerra = 6371;

    const lat = grausParaRadianos(lat2 - lat1);
    const lon = grausParaRadianos(lon2 - lon1);

    const a =
        Math.sin(lat / 2) * Math.sin(lat / 2) +
        Math.cos(grausParaRadianos(lat1)) *
        Math.cos(grausParaRadianos(lat2)) *
        Math.sin(lon / 2) *
        Math.sin(lon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return raioTerra * c;
}



function grausParaRadianos(graus) {
    return graus * (Math.PI / 180);
}