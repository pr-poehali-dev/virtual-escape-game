import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Save and load user progress (levels, skins)
    Args: event with httpMethod (GET/POST), headers (X-User-Id), body (level_id, completed)
    Returns: HTTP response with progress data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute(
            "SELECT level_id, completed FROM user_progress WHERE user_id = %s",
            (user_id,)
        )
        progress = [{'level_id': row[0], 'completed': row[1]} for row in cur.fetchall()]
        
        cur.execute(
            "SELECT skin_id, active FROM user_skins WHERE user_id = %s",
            (user_id,)
        )
        skins = [{'skin_id': row[0], 'active': row[1]} for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'progress': progress, 'skins': skins}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'complete_level':
            level_id = body_data.get('level_id')
            if not level_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'level_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO user_progress (user_id, level_id, completed, completed_at) VALUES (%s, %s, TRUE, NOW()) ON CONFLICT (user_id, level_id) DO UPDATE SET completed = TRUE, completed_at = NOW()",
                (user_id, level_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Progress saved'}),
                'isBase64Encoded': False
            }
        
        elif action == 'set_active_skin':
            skin_id = body_data.get('skin_id')
            if not skin_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'skin_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE user_skins SET active = FALSE WHERE user_id = %s", (user_id,))
            cur.execute("UPDATE user_skins SET active = TRUE WHERE user_id = %s AND skin_id = %s", (user_id, skin_id))
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Skin updated'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
