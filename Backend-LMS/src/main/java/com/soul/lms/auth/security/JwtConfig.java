package com.soul.lms.auth.security;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;

@Service("jwtConfig")
public class JwtConfig
{

	public PrivateKey generateJwtKeyEncryption() throws NoSuchAlgorithmException, InvalidKeySpecException, IOException{

		ClassPathResource resource = new ClassPathResource("RSAkey/private_key.pem");

		try (InputStream inputStream = resource.getInputStream()) {

			// Read the entire PEM file and remove the header/footer and line breaks
			String privateKeyPEM = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8)
					.replace("-----BEGIN PRIVATE KEY-----", "")
					.replace("-----END PRIVATE KEY-----", "")
					.replaceAll("\\s+", "");

			// Decode the base64-encoded key and generate the private key
			byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");

			return keyFactory.generatePrivate(keySpec);
		}
	}

	public PublicKey generateJwtKeyDecryption() throws NoSuchAlgorithmException, InvalidKeySpecException, IOException {

		// Use InputStream to load the resource from the classpath
		ClassPathResource resource = new ClassPathResource("RSAkey/public_key.pem");

		try (InputStream inputStream = resource.getInputStream()) {

			// Read the entire PEM file and remove the header/footer and line breaks
			String publicKeyPEM = new String(inputStream.readAllBytes())
					.replace("-----BEGIN PUBLIC KEY-----", "")
					.replace("-----END PUBLIC KEY-----", "")
					.replaceAll("\\s+", "");

			// Decode the base64-encoded key and generate the public key
			byte[] decodedKey = Base64.getDecoder().decode(publicKeyPEM);
			X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");

			return keyFactory.generatePublic(keySpec);
		}
	}

}