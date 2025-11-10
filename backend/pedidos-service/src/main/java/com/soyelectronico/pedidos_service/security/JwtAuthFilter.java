package com.soyelectronico.pedidos_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final String jwtSecret = "soy_una_contra_super_ultra_segura_1234567890";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8))
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String email = claims.get("email", String.class);
                String rol = claims.get("rol", String.class); // "cliente" o "admin"
                String userId = claims.getSubject(); // id usuario

                System.out.println("✅ TOKEN OK - email: " + email + " rol: " + rol + " userId: " + userId);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    User principal = new User(email, "", Collections.emptyList());

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    Collections.emptyList()
                            );
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // dejamos info útil para los controladores
                    request.setAttribute("usuarioId", userId);
                    request.setAttribute("usuarioRol", rol);
                }

            } catch (SignatureException e) {
                System.out.println("⚠️ Token JWT inválido: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("⚠️ Error procesando token JWT: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
