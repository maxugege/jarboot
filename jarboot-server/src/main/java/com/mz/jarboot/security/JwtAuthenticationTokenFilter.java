package com.mz.jarboot.security;

import com.mz.jarboot.constant.AuthConst;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @author majianzheng
 */
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
    private static final String TOKEN_PREFIX = "Bearer ";
    
    private final JwtTokenManager tokenManager;
    private final PermissionManager permissionManager;

    public JwtAuthenticationTokenFilter(JwtTokenManager tokenManager, PermissionManager permissionManager) {
        this.tokenManager = tokenManager;
        this.permissionManager = permissionManager;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        String jwt = resolveToken(request);
        
        if (StringUtils.isNotBlank(jwt) && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                this.tokenManager.validateToken(jwt);
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
                return;
            }
            Authentication authentication = this.tokenManager.getAuthentication(jwt);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            if (permissionManager.hasPermission(authentication.getName(), request)) {
                chain.doFilter(request, response);
            } else {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden!");
            }
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
        }
    }
    
    /**
     * Get token from header.
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AuthConst.AUTHORIZATION_HEADER);
        if (StringUtils.isNotBlank(bearerToken) && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        String jwt = request.getParameter(AuthConst.ACCESS_TOKEN);
        if (StringUtils.isNotBlank(jwt)) {
            return jwt;
        }
        return null;
    }
}
