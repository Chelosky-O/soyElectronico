package com.soyelectronico.usuarios_service.security;

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
import java.util.Collections;

// Filtro JWT que valida el token en cada petición y autentica al usuario en el contexto de Spring
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final String jwtSecret = "soy_una_contra_super_ultra_segura_1234567890"; // misma clave que usas al generar
    // Método principal que intercepta cada petición HTTP para validar el token
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // Extrae el token sin el prefijo "Bearer "
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret.getBytes())
                        .parseClaimsJws(token)
                        .getBody();
                // Valida y decodifica el token JWT para obtener sus claims (datos)
                String email = claims.get("email", String.class);
                String rol = claims.get("rol", String.class);
                // Extrae el email y el rol del token

                // Crea un objeto de autenticación con los datos del token
                User principal = new User(email, "", Collections.emptyList());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Guarda la autenticación en el contexto de Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (SignatureException e) {
                System.out.println("Token JWT inválido: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("Error al procesar token JWT: " + e.getMessage());
            }
        }

        // Continúa con el siguiente filtro de la cadena
        filterChain.doFilter(request, response);
    }
}
