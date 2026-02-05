package com.kilgore.fooddeliveryapp.service;

import com.kilgore.fooddeliveryapp.model.USER_ROLE;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;

@Service
public class JwtService {

    private static final String SECRET = "bXktc3VwZXItc2VjcmV0LWtleS1teS1zdXBlci1zZWNyZXQta2V5LTEyMzQ1Njc4OTA=";

    private static final long EXPIRATION_TIME = 86_400_000;

    public String generateToken(Authentication authentication) {
        String email = authentication.getName();
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = populateAuthorities(authorities);

        Map<String, Object> claims = new HashMap<String, Object>();

        claims.put("email", email);
        claims.put("authorities", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String email,  USER_ROLE role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("authorities", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    private Key getKey() {
        byte[] keyBytes = Base64.getDecoder().decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
        StringBuilder sb = new StringBuilder();
        for (GrantedAuthority grantedAuthority : authorities) {
            sb.append(grantedAuthority.getAuthority());
        }
        return sb.toString();
    }

    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject();
    }


    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractAuthorities(String token) {
        Claims claims = extractClaims(token);
        return claims.get("authorities", String.class);
    }

    public boolean isTokenExpired(String token) {
        return System.currentTimeMillis() > getExpiresAt(token);
    }

    public long getExpiresAt(String token) {
        Claims claims = extractClaims(token);
        return claims.getExpiration().getTime();
    }
}
