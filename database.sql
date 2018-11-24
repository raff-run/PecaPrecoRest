-- Fabricantes
CREATE TABLE public.tab_fabricantes
(
    pk_id_fabricante SERIAL,
    nome character varying(255)  NOT NULL,
    CONSTRAINT tab_fabricantes_pkey PRIMARY KEY (pk_id_fabricante)
);

-- Modelos
CREATE TABLE public.tab_modelos
(
    pk_id_modelo SERIAL,
    nome character varying(255)  NOT NULL,
    fk_fabricante integer,
    CONSTRAINT tab_modelos_pkey PRIMARY KEY (pk_id_modelo),
    FOREIGN KEY (fk_fabricante)
        REFERENCES public.tab_fabricantes (pk_id_fabricante)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

-- Carros
CREATE TABLE public.tab_carros
(
    pk_id_carro SERIAL,
    ano integer NOT NULL,
    detalhe character varying(255)  NOT NULL,
    fk_fabricante integer,
    fk_modelo integer,
    CONSTRAINT tab_carros_pkey PRIMARY KEY (pk_id_carro),
    FOREIGN KEY (fk_modelo)
        REFERENCES public.tab_modelos (pk_id_modelo)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (fk_fabricante)
        REFERENCES public.tab_fabricantes (pk_id_fabricante)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

--Usuários
CREATE TABLE public.tab_usuarios
(
    pk_id_usuario SERIAL,
    cidade character varying(255)  NOT NULL,
    email character varying(30) UNIQUE NOT NULL,
    nome character varying(255)  NOT NULL,
    senha character varying(20)  NOT NULL,
    uf character varying(2)  NOT NULL,
    CONSTRAINT tab_usuarios_pkey PRIMARY KEY (pk_id_usuario)
);

-- Carros de usuários

CREATE TABLE public.tab_carros_usuario
(
    pk_id_carro_usuario SERIAL,
    anofabricacao integer,
    chassi character varying(20)  UNIQUE NOT NULL,
    data_compra date,
    quilometragem integer,
    fk_id_carro integer,
    fk_id_usuario integer,
    CONSTRAINT tab_carros_usuario_pkey PRIMARY KEY (pk_id_carro_usuario),
    FOREIGN KEY (fk_id_carro)
        REFERENCES public.tab_carros (pk_id_carro)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (fk_id_usuario)
        REFERENCES public.tab_usuarios (pk_id_usuario)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

--Histórico
CREATE TABLE public.tab_historicos
(
    pk_id_historico SERIAL,
    dadosobd jsonb NOT NULL,
    latitudechegada integer,
    latitudepartida integer,
    longitudechegada integer,
    longitudepartida integer,
    dataHoraEnvio timestamp default now(),
    fk_id_carrousuario integer,
    CONSTRAINT tab_historicos_pkey PRIMARY KEY (pk_id_historico),
    FOREIGN KEY (fk_id_carrousuario)
        REFERENCES public.tab_carros_usuario (pk_id_carro_usuario) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);


-- Endereços
CREATE TABLE public.tab_enderecos
(
    pk_id_endereco SERIAL,
    bairro character varying(255) NOT NULL,
    cep integer NOT NULL,
    cidade character varying(255) NOT NULL,
    complemento character varying(255) NOT NULL,
    latitude integer NOT NULL,
    logradouro character varying(255) NOT NULL,
    longitude integer NOT NULL,
    numero character varying(255) NOT NULL,
    referencia character varying(255) NOT NULL,
    uf character varying(2) NOT NULL,
    CONSTRAINT tab_enderecos_pkey PRIMARY KEY (pk_id_endereco)
);

-- Lojas

CREATE TABLE public.tab_lojas
(
    pk_id_loja SERIAL,
    cnpj character varying(255)  NOT NULL,
    nome character varying(255)  NOT NULL,
    fk_endereco integer,
    fk_fabricante integer,
    imagem oid,
    CONSTRAINT tab_lojas_pkey PRIMARY KEY (pk_id_loja),
    FOREIGN KEY (fk_endereco)
        REFERENCES public.tab_enderecos (pk_id_endereco) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (fk_fabricante)
        REFERENCES public.tab_fabricantes (pk_id_fabricante) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

-- Serviços

CREATE TABLE public.tab_servicos
(
    pk_id_servico SERIAL,
    nome character varying(255)  NOT NULL,
    CONSTRAINT tab_servicos_pkey PRIMARY KEY (pk_id_servico)
);

CREATE TABLE public.tab_presta_servicos
(
    pk_id_presta_servico SERIAL,
    preco real,
    fk_id_loja integer,
    fk_id_servico integer,
    CONSTRAINT tab_presta_servicos_pkey PRIMARY KEY (pk_id_presta_servico),
    FOREIGN KEY (fk_id_loja)
        REFERENCES public.tab_lojas (pk_id_loja) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    FOREIGN KEY (fk_id_servico)
        REFERENCES public.tab_servicos (pk_id_servico) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

-- Sessões
CREATE TABLE public.tab_sessoes
(
    pk_id_sessao SERIAL,
    token character varying(255)  UNIQUE NOT NULL,
    validoate timestamp without time zone NOT NULL DEFAULT now() + interval '30 days',
    fk_id_usuario integer,
    CONSTRAINT tab_sessoes_pkey PRIMARY KEY (pk_id_sessao),
    FOREIGN KEY (fk_id_usuario)
        REFERENCES public.tab_usuarios (pk_id_usuario) 
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);

-- Functions para retornar JSON

-- Busca de forma sucinta por lojas usando parte dos seus nomes. Para ser usado na barra de pesquisa.
create or replace function buscarLojasPorNome(varchar(255))  
returns setof json
as $$
DECLARE
	nomeBuscaLike varchar := ('%'|| $1 || '%');
begin 
		
  return query select json_agg(row_to_json(t) order by length(nome) asc) as lojas
					from (
					  select l.pk_id_loja, l.nome
					  from tab_lojas l
						where l.nome ILIKE nomeBuscaLike
						LIMIT 15
					) t;
end;
$$ 
language plpgsql;

-- Retorna a senha e o id de um usuário ao receber um Email
create or replace function buscarUsuarioPorEmail(varchar(255))  
returns setof json
as $$
begin 
		
  return query select row_to_json(t) as usuarios
					from (
					  select u.pk_id_usuario, u.senha
					  from tab_usuarios u
						where u.email = $1
					) t;
end;
$$ 
language plpgsql;

-- retorna uma "página" de históricos de um carro em um determinado período.
create or replace function lerQuantHistoricoJson(integer, timestamp, timestamp, integer, integer)  
returns setof json
as $$
DECLARE
data_inicio timestamp;
data_fim timestamp;
begin 
	if($3 is null) then
		data_fim := now();
	else
		data_fim := $3;
	end if;
	if($2 is null) then
		data_inicio := '01/01/1500 00:00:00.000000';
	else
		data_inicio := $2;
	end if;
	
		
  return query select json_agg(row_to_json(t)) as lojas
					from (
					  select h.pk_id_historico, h.dadosobd, h.latitudepartida, h.longitudepartida, h.latitudechegada, h.longitudechegada, h.dataHoraEnvio, car.fk_id_usuario
					  from tab_historicos h join tab_carros_usuario car ON (h.fk_id_carrousuario = car.pk_id_carro_usuario)
						where h.dataHoraEnvio >= data_inicio and h.dataHoraEnvio <= data_fim and h.fk_id_carrousuario = $1
						LIMIT $4 OFFSET $5
					) t;
end;
$$ 
language plpgsql;

-- Retorna uma "página" de lojas com todas as informações das lojas, seus serviços e preços
create or replace function lerQuantLojasCompletaJson(integer, integer)  
returns setof json
as $$
begin 
  return query select json_agg(row_to_json(t)) as lojas
					from (
					  select l1.pk_id_loja, l1.nome, l1.cnpj, f.nome as autorizada,
						(
						  select array_to_json(array_agg(row_to_json(d)))
						  from (
							select s.nome, ps.preco
							from tab_servicos s
							  join tab_presta_servicos ps ON (s.pk_id_servico = ps.fk_id_servico)
							  join tab_lojas l ON (l.pk_id_loja = ps.fk_id_loja)
							  where l.pk_id_loja = l1.pk_id_loja
							order by nome asc
						  ) d
						) as servicos
					  from tab_lojas l1 LEFT OUTER JOIN tab_fabricantes f ON (l1.fk_fabricante = f.pk_id_fabricante) LIMIT $1 OFFSET $2
					) t;
end;
$$ 
language plpgsql;